#include "acceptor.h"

#include <fcntl.h>

#include "channel.h"
#include "event_loop.h"
#include "socket.h"
Acceptor::Acceptor(EventLoop* loop) {
  socket = new Socket();
  int flags = fcntl(socket->GetSocketfd(), F_GETFL, 0);
  fcntl(socket->GetSocketfd(), F_SETFL, flags | O_NONBLOCK);
  socket->BindSocket();
  socket->Listen();
  channel = new Channel(loop, socket->GetSocketfd());
  std::function<void()> lambda = [this]() { this->Connect(); };
  channel->SetCallBack(lambda);
  channel->Read();
}
Acceptor::~Acceptor() {
  delete channel;
  delete socket;
}
void Acceptor::Connect() {
  callback(socket);
}
void Acceptor::SetCallBack(std::function<void(Socket* socket)> lambda) {
  callback = lambda;
}