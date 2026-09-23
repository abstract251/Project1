#include "acceptor.h"

#include <fcntl.h>

#include "channel.h"
#include "event_loop.h"
#include "socket.h"
Acceptor::Acceptor(EventLoop* loop) {
  socket = std::make_unique<Socket>();
  int flags = fcntl(socket->GetSocketfd(), F_GETFL, 0);
  fcntl(socket->GetSocketfd(), F_SETFL, flags | O_NONBLOCK);
  socket->BindSocket();
  socket->Listen();
  channel = std::make_unique<Channel>(loop, socket->GetSocketfd());
  std::function<void()> lambda = [this]() { this->Connect(); };
  channel->SetReadCallBack(lambda);
  channel->Read();
}
Acceptor::~Acceptor() {}
void Acceptor::Connect() {
  while (true) {
    int fd = socket->Accept();
    if (fd < 0)
      break;
    callback(fd);
  }
}
void Acceptor::SetCallBack(std::function<void(int)> const& lambda) {
  callback = lambda;
}