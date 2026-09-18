#include "channel.h"
#include <iostream>
#include "event_loop.h"
Channel::Channel(EventLoop *e, int a)
{
    ep = e;
    fd = a;
    event = 0;
}
int Channel::Get()
{
    return fd;
}
void Channel::Read()
{
    event = EPOLLIN | EPOLLET;
    ep->UpdateChannel(this);
}
uint32_t Channel::Getevent()
{
    return event;
}
bool Channel::GetIn()
{
    return inEventLoop;
}
void Channel::ModIn(bool a)
{
    inEventLoop = a;
}
void Channel::SetRevent(uint32_t a)
{
    revent = a;
}
uint32_t Channel::GetRevent()
{
    return revent;
}

void Channel::Handle()
{
    callback();
}
void Channel::SetCallBack(std::function<void()> put)
{
    callback = put;
}