#include <functional>
#pragma once
class Channel;
class EventLoop;
class Socket;
class Acceptor {
 public:
  Acceptor(EventLoop* el);
  ~Acceptor();
  void Connect();
  void SetCallBack(std::function<void(int)> const& lambda);

 private:
  Channel* channel;
  std::function<void(int)> callback;
  Socket* socket;
};