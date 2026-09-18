#pragma once
#include <functional>
class Socket;
class EventLoop;
class Channel;
class Buffer;
class Connect {
 public:
  enum State { Invalid = 1, Closed, Connected };
  Connect(Socket* socket, EventLoop* loop);
  ~Connect();
  void Handle();
  void SetCallBack(std::function<void()> lambda);
  void SetClose(std::function<void()> _close);
  int Get();
  void Close();
  void Read();
  void Write();

 private:
  Channel* channel;
  std::function<void()> callback;
  Socket* socket;
  std::function<void()> close;
  Buffer* readBuffer;
  Buffer* writeBuffer;
  State state;
};
