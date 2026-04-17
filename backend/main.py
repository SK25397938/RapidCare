import asyncio
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

hospitals = [
    {"id": "h1", "name": "City Hospital", "beds": 5, "type": "Cardiac", "lat": 19.076, "lng": 72.8777},
    {"id": "h2", "name": "Care Hospital", "beds": 2, "type": "General", "lat": 19.085, "lng": 72.835},
    {"id": "h3", "name": "Metro Hospital", "beds": 0, "type": "Trauma", "lat": 19.05, "lng": 72.88},
]

MAX_BEDS = 10

async def simulate():
    while True:
        for h in hospitals:
            change = random.choice([-1, 0, 1])
            h["beds"] = max(0, min(MAX_BEDS, h["beds"] + change))

        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate())

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            await ws.send_json(hospitals)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("Client disconnected")