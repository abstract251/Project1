#include <mutex>
#include <thread>
#include <functional>
#include <vector>
#include <queue>
#include <future>
#include <type_traits>
#include <condition_variable>
#pragma once
class Thread
{
public:
    Thread(int size = (std::thread::hardware_concurrency() > 0 ? std::thread::hardware_concurrency() : 10));
    ~Thread();
    template <class T, class... Args>
    auto AddTasks(T &&t, Args &&...args) -> std::future<std::invoke_result_t<T, Args...>>;
    int GetSize();

private:
    std::mutex mtx;
    std::queue<std::function<void()>> tasks;
    std::vector<std::thread> threads;
    std::condition_variable cv;
    bool stop;
    int _size;
};

template <class T, class... Args>
auto Thread::AddTasks(T &&t, Args &&...args) -> std::future<std::invoke_result_t<T, Args...>>
{
    using type = std::invoke_result_t<T, Args...>;
    auto task = std::make_shared<std::packaged_task<type()>>([func = std::forward<T>(t), ... input = std::forward<Args>(args)]() mutable -> type
                                                             { return std::invoke(std::move(func), std::move(input)...); });
    std::future<type> fu = task->get_future();
    {
        std::unique_lock<std::mutex> lock(mtx);
        if (stop)
            throw std::runtime_error("线程池已关闭，无法添加任务！");
        tasks.emplace([task]()
                      { (*task)(); });
    }
    cv.notify_one();
    return fu;
}