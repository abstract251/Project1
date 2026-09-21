#include <sys/epoll.h>

#include <vector>

#include "channel.h"
#pragma once
#define MAX_COUNT 124
class Channel;
class Epoll {
 public:
  Epoll();
  void Create();
  int Get();
  int Wait();
  void ADD(int a);
  void MOD(int a);
  void DEL(int a);
  int Getfd(int a);
  epoll_event* Getev();
  void UpdateChannel(Channel* channel);
  std::vector<Channel*> Poll(int timeout = -1);
  void DelChannel(Channel* channel);

 private:
  int epollfd;
  struct epoll_event evarr[MAX_COUNT];
};