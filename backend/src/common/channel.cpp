#include "channel.h"

#include <iostream>

#include "event_loop.h"
Channel::Channel(EventLoop* e, int a) {
  ep = e;
  fd = a;
  event = 0;
}
int Channel::Get() {
  return fd;
}
void Channel::Read() {
  event = EPOLLIN | EPOLLET;
  ep->UpdateChannel(this);
}
uint32_t Channel::Getevent() {
  return event;
}
bool Channel::GetIn() {
  return inEventLoop;
}
void Channel::ModIn(bool a) {
  inEventLoop = a;
}
void Channel::SetRevent(uint32_t a) {
  revent = a;
}
uint32_t Channel::GetRevent() {
  return revent;
}

void Channel::Handle() {
  if ((revent & EPOLLIN) && readCallback)
    readCallback();
  if ((revent & EPOLLOUT) && writeCallback)
    writeCallback();
}
void Channel::SetReadCallBack(std::function<void()> put) {
  readCallback = put;
}
void Channel::SetWriteCallBack(std::function<void()> put) {
  writeCallback = put;
}
Channel::~Channel() {
  ep->Del(this);
}
void Channel::EnableWrite() {
  event |= EPOLLOUT;
  ep->UpdateChannel(this);
}
void Channel::DisableWrite() {
  event &= ~EPOLLOUT;
  ep->UpdateChannel(this);
}