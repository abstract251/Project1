#include "event_loop.h"

#include <iostream>

#include "epoll.h"
using namespace std;
EventLoop::EventLoop() {
  quit = false;
  ep = make_unique<Epoll>();
  inloop = false;
}
EventLoop::~EventLoop() {}
void EventLoop::loop() {
  while (!quit) {
    inloop = true;
    vector<Channel*> vec = ep->Poll();
    for (auto it = vec.begin(); it != vec.end(); ++it) {
      (*it)->Handle();
    }
    inloop = false;
    auto tasks = move(delTasks);
    delTasks.clear();
    for (auto t : tasks) t();
  }
}
void EventLoop::UpdateChannel(Channel* channel) {
  ep->UpdateChannel(channel);
}
void EventLoop::Del(Channel* channel) {
  ep->DelChannel(channel);
}
void EventLoop::SetTasks(std::function<void()> lambda) {
  if (inloop)
    delTasks.push_back(lambda);
  else
    lambda();
}