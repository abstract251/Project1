#include "thread.h"
#include <iostream>
using namespace std;
Thread::Thread(int size) : _size(size)
{
    stop = false;
    for (int i = 0; i < size; i++)
    {
        threads.emplace_back(thread([this]()
                                    {
            while (true)
            {
                function<void()> task;
                {
                    unique_lock<mutex> lock(mtx);
                    cv.wait(lock, [this]()
                            { return stop || !tasks.empty(); });
                    if(stop && tasks.empty())
                        return;
                    task = tasks.front();
                    tasks.pop();
                }
                task();
            } }));
    }
}
Thread::~Thread()
{
    {
        unique_lock<mutex> lock(mtx);
        stop = true;
        tasks = queue<function<void()>>();
    }
    cv.notify_all();
    for (int i = 0; i < threads.size(); i++)
    {
        if (threads[i].joinable())
            threads[i].join();
    }
}
int Thread::GetSize()
{
    return _size;
}
