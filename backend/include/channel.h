#include <sys/epoll.h>

#include <functional>

#include "event_loop.h"
#pragma once
class EventLoop;
class Thread;
class Channel {
 public:
  Channel(EventLoop* e, int a);
  ~Channel();
  void Read();
  int Get();
  uint32_t Getevent();
  bool GetIn();
  void ModIn(bool a);
  void SetRevent(uint32_t a);
  uint32_t GetRevent();
  void Handle();
  void SetReadCallBack(std::function<void()> put);
  void SetWriteCallBack(std::function<void()> put);
  void EnableWrite();
  void DisableWrite();

 private:
  int fd;
  EventLoop* ep;
  uint32_t event;
  uint32_t revent;
  bool inEventLoop = false;
  std::function<void()> readCallback;
  std::function<void()> writeCallback;
};
