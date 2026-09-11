#include <iostream>
#include "server.h"
#include "event_loop.h"
using namespace std;

int main()
{
    EventLoop *loop = new EventLoop();
    Server s(loop);
    loop->loop();
    return 0;
}
