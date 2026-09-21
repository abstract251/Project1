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
  unsigned int size = thread::hardware_concurrency();
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
  function<void(int)> lambda = [this](int fd) { this->Del(fd); };
  con->SetDel(lambda);
  con->SetCallBack(_revc);
  connections[fd] = move(con);
  if (_con) {
    _con(connections[fd].get());
  }
}
void Tcp::Del(int fd) {
  auto it = connections.find(fd);
  if (it != connections.end()) {
    Connect* con = it->second.get();
    connections.erase(it);
  } else {
    cerr << "删除失败，fd值为" << fd << "的connect不存在" << endl;
  }
}
void Tcp::SetCon(function<void(Connect*)> lambda) {
  _con = move(lambda);
}
void Tcp::SetRevc(std::function<void(Connect*)> lambda) {
  _revc = move(lambda);
}