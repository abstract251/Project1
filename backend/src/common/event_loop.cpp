#include "event_loop.h"
#include "epoll.h"
#include <iostream>
using namespace std;
EventLoop::EventLoop()
{
    quit = false;
    ep = new Epoll();
}
EventLoop::~EventLoop()
{
    delete ep;
}
void EventLoop::loop()
{
    while (!quit)
    {
        vector<Channel *> vec = ep->Poll();
        for (auto it = vec.begin(); it != vec.end(); ++it)
        {
            (*it)->Handle();
        }
    }
}
void EventLoop::UpdateChannel(Channel *channel)
{
    ep->UpdateChannel(channel);
}
