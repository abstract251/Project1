#pragma once
#include <functional>
class Socket;
class EventLoop;
class Channel;
class Connect
{
public:
    Connect(Socket *socket, EventLoop *loop);
    ~Connect();
    void Handle();
    void SetCallBack(std::function<void()> lambda);
    int Get();

private:
    Channel *channel;
    std::function<void()> callback;
    int socketfd;
};
