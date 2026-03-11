#ifndef IA_HPP
# define IA_HPP

# include "chess.hpp"
# include "evaluation_tables.hpp"
# include <iostream>
# include <string>
# include <cstdlib>

std::string	getIaMove(chess::Board &board, int depth, float errorChance);

# endif
