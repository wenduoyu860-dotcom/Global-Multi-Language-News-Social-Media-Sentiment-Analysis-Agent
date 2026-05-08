import uvicorn


if __name__ == "__main__":
    uvicorn.run("backend_realtime.app:app", host="127.0.0.1", port=8090, reload=False)

