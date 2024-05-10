import uvicorn

from app import create_app

HOST = "127.0.0.1"
PORT = 4040

application = create_app()

if __name__ == "__main__":
    uvicorn.run(application, host=HOST, port=PORT)
