#include <functional>
class Epoll;
class Channel;
#pragma once
class EventLoop
{
public:
    EventLoop();
    ~EventLoop();
    void loop();
    void UpdateChannel(Channel *channel);

private:
    Epoll *ep;
    bool quit;
};