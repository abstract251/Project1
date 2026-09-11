#pragma once

#ifndef LIGHTWEBSERVER_ERROR_H
#define LIGHTWEBSERVER_ERROR_H

#define ERROR_EXIT -1

/* condition 为真时打印错误信息并以 ERROR_EXIT 退出
   message 使用 const char*，避免字符串字面量转 char* 的编译警告 */
void errif(bool condition, const char *message);

#endif /* LIGHTWEBSERVER_ERROR_H */
