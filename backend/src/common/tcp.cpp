#include "tcp.h"

#include <iostream>

#include "acceptor.h"
#include "connect.h"
#include "event_loop.h"
#include "thread.h"
using namespace std;
Tcp::Tcp() {
  mainReactor = make_unique<EventLoop>();
  acceptor = make_unique<Acceptor>(mainReactor.get());
  unsigned int size =
      thread::hardware_concurrency() > 0 ? thread::hardware_concurrency() : 10;
  function<void(int)> lambda = [this](int fd) { this->Connection(fd); };
  acceptor->SetCallBack(lambda);
  _thread = make_unique<Thread>(size);
  for (int i = 0; i < size; i++) {
    subReactors.push_back(make_unique<EventLoop>());
  }
}
void Tcp::Start() {
  for (int i = 0; i < subReactors.size(); ++i) {
    function<void()> lambda = [sub = subReactors[i].get()]() { sub->loop(); };
    _thread->AddTasks(lambda);
  }
  mainReactor->loop();
}
Tcp::~Tcp() {}
void Tcp::Connection(int fd) {
  int random = fd % subReactors.size();
  unique_ptr<Connect> con = make_unique<Connect>(fd, subReactors[random].get());
  function<void(int, Connect*)> lambda = [this](int fd, Connect* con) {
    this->SetDel(fd, con);
  };
  con->SetDel(lambda);
  con->SetCallBack(_revc);
  {
    unique_lock<mutex> lock(mtx);
    connections[fd] = move(con);
  }
  if (_con) {
    _con(connections[fd].get());
  }
}
void Tcp::SetCon(function<void(Connect*)> lambda) {
  _con = move(lambda);
}
void Tcp::SetRevc(std::function<void(Connect*)> lambda) {
  _revc = move(lambda);
}
void Tcp::Del(int fd, Connect* con) {
  unique_lock<mutex> lock(mtx);
  auto it = connections.find(fd);
  if (it == connections.end())
    return;
  else if (it->second.get() != con)
    return;
  else
    connections.erase(it);
}
void Tcp::SetDel(int fd, Connect* con) {
  std::function<void()> lambda = [this, fd, con]() { this->Del(fd, con); };
  subReactors[fd % subReactors.size()].get()->SetTasks(lambda);
}