#include <functional>
#include <memory>
#include <vector>
class Epoll;
class Channel;
#pragma once
class EventLoop {
 public:
  EventLoop();
  ~EventLoop();
  void loop();
  void UpdateChannel(Channel* channel);
  void Del(Channel* channel);
  void SetTasks(std::function<void()> lambda);

 private:
  std::unique_ptr<Epoll> ep;
  bool quit;
  bool inloop;
  std::vector<std::function<void()>> delTasks;
};