#include "ia.hpp"

int	main(int ac, char **av)
{
	if (ac != 4)
	{
		std::cerr << "Usage: ./ia_engine <fen> <depth> <errorChance>";
		return (1);
	}

	std::string	fen = av[1];
	int	depth = std::atoi(av[2]);
	float errorChance = std::atof(av[3]);

	srand(time(NULL));

	chess::Board board = chess::Board(std::string_view(fen));
	std::cout << getIaMove(board, depth, errorChance) << std::endl;

	return (0);
}
