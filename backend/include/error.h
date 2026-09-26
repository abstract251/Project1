#pragma once
#include <string>

#ifndef LIGHTWEBSERVER_ERROR_H
#define LIGHTWEBSERVER_ERROR_H

#define ERROR_EXIT -1

void errif(bool condition, const char *message);
std::string buildError(int code);
std::string statusCode(int code);

#endif
