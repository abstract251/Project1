#include <functional>
#include <memory>
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
  std::unique_ptr<Socket> socket;
  std::unique_ptr<Channel> channel;
  std::function<void(int)> callback;
};