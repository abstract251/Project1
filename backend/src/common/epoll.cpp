#include "epoll.h"

#include <iostream>

#include "error.h"
using namespace std;

Epoll::Epoll() {
  epollfd = epoll_create1(0);
  errif(epollfd < 0, "创建epoll失败");
}

int Epoll::Get() {
  return epollfd;
}
int Epoll::Wait() {
  int a = epoll_wait(epollfd, evarr, MAX_COUNT, -1);
  errif(a < 0, "监听事件失败");
  return a;
}
void Epoll::ADD(int a) {
  struct epoll_event tmp;
  tmp.events = EPOLLIN | EPOLLET;
  tmp.data.fd = a;
  errif((epoll_ctl(epollfd, EPOLL_CTL_ADD, a, &tmp)), "添加epoll事件失败");
}
void Epoll::MOD(int a) {
  struct epoll_event tmp;
  tmp.events = EPOLLIN | EPOLLET;
  tmp.data.fd = a;
  errif((epoll_ctl(epollfd, EPOLL_CTL_MOD, a, &tmp)), "修改epoll事件失败");
}
void Epoll::DEL(int a) {
  errif((epoll_ctl(epollfd, EPOLL_CTL_DEL, a, NULL)), "删除epoll事件失败");
}
int Epoll::Getfd(int a) {
  return evarr[a].data.fd;
}
epoll_event* Epoll::Getev() {
  return evarr;
}
void Epoll::UpdateChannel(Channel* a) {
  int fd = a->Get();
  struct epoll_event ev2;
  ev2.data.ptr = a;
  ev2.events = a->Getevent();
  if (!a->GetIn()) {
    errif(epoll_ctl(epollfd, EPOLL_CTL_ADD, fd, &ev2) < 0, "EPOLL添加失败");
    a->ModIn(true);
  } else {
    errif(epoll_ctl(epollfd, EPOLL_CTL_MOD, fd, &ev2) < 0, "EPOLL修改失败");
  }
}
vector<Channel*> Epoll::Poll(int timeout) {
  vector<Channel*> ep;
  int npfd = epoll_wait(epollfd, evarr, MAX_COUNT, timeout);
  errif(npfd < 0, "添加事件到epoll红黑树失败");
  for (int i = 0; i < npfd; i++) {
    Channel* a = (Channel*)evarr[i].data.ptr;
    a->SetRevent(evarr[i].events);
    ep.push_back(a);
  }
  return ep;
}
void Epoll::DelChannel(Channel* channel) {
  int fd = channel->Get();
  errif(epoll_ctl(epollfd, EPOLL_CTL_DEL, fd, nullptr) < 0, "EPOLL删除失败");
}