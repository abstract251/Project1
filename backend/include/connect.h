#pragma once
#include <functional>
class Socket;
class EventLoop;
class Channel;
class Buffer;
class Connect {
 public:
  enum State { Invalid = 1, Closed, Connected };
  Connect(int fd, EventLoop* loop);
  ~Connect();
  void Handle();
  void SetCallBack(std::function<void(Connect*)> lambda);
  void SetDel(std::function<void(int)> _close);
  int Get();
  void Close();
  void Read();
  void nonBlockRead();
  void Write();
  void nonBlockWrite();

 private:
  Channel* channel;
  std::function<void(Connect*)> callback;
  Socket* socket;
  Buffer* readBuffer;
  Buffer* writeBuffer;
  State state;
  std::function<void(int)> del;
};
