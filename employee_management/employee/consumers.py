import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from .models import ChatMessage, ChatConversation
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        print("conversation_id is here ",self.conversation_id)

        user = self.scope["user"]

        if user == AnonymousUser():
            await self.close()
        else:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        sender_id = data.get('sender')

        # HANDLE TYPING EVENT
        if data.get("type") == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_event",   #  different handler
                    "sender": sender_id
                }
            )
            return

        #  NORMAL MESSAGE
        message = data.get('message')

        chat_message = await self.save_message(sender_id, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_id,
                'id': str(chat_message.id)
            }
        )

    # MESSAGE HANDLER
    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    #  TYPING HANDLER
    async def typing_event(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing",
            "sender": event["sender"]
        }))

    @sync_to_async
    def save_message(self, sender_id, message):
        conversation = ChatConversation.objects.get(id=self.conversation_id)
        return ChatMessage.objects.create(
            conversation=conversation,
            sender_id=sender_id,
            content=message
        )