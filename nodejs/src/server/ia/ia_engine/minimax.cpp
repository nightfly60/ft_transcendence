#include "ia.hpp"

// avoir l'index en fonction de la couleur parce que le plateau change de sens
int	getTableIndex(chess::Square square, chess::Color color)
{
	int sq = square.index(); // int entre 0 et 64

	if (color == chess::Color::WHITE)
	{
		int rank = sq / 8; // 1 a 8
		int file = sq % 8; // a a h
		return ((7 - rank) * 8 + file);
	}
	else
		return (sq);
}

// fonction pour check si le roi est en securite (score en fonction des pieces alliees autour de lui et de si il est attaque)
int	getKingSecurity(const chess::Board &board, chess::Color color)
{
	chess::Square king_pos = board.kingSq(color);
	int	score = 0;
	int	neighbors = 0;

	chess::Bitboard near_squares = chess::attacks::king(king_pos);

	while (near_squares)
	{
		int	sq_index = near_squares.pop();
		chess::Square sq(sq_index);
		chess::Piece piece = board.at(sq);

		if (piece != chess::Piece::NONE && piece.color() == color)
			score += 5;
	}

	if (board.isAttacked(king_pos, ~color)) // ~ operateur dans la lib pour avoir la couleur oposee
		score -= 100;

	return (score);
}

/*
	avoir le score de la position pour connaitre l'avantage :
	on recup les informations de chaque piece pour etablir une valeur a ajouter
	sur un score totale pour chaque couleur a partir de ces facteurs:
		- Le materiel (qui a le plus de pieces)
		- Le controle du centre (ou sont placees les pieces -> + elles sont au centre + elles ont de valeur)
		- L'avancement des pions (promotion)
		- Est ce que le roi est protege (pieces alliees autour de lui)
	methode : https://youtu.be/0oH-eqODWXI?si=fXdGndJ5M34nHhbq
*/
int	getPositionScore(const chess::Board &board)
{
	int	white_score = 0;
	int	black_score = 0;

	chess::Bitboard	pieces_bb = board.occ(); // avoir un bitboard sur toutes les cases occupees par des pieces 0 / 1

	while (pieces_bb) // pour chaque pieces
	{
		// on get des infos
		chess::Square sq = chess::Square(pieces_bb.pop());
		chess::Piece piece = board.at(sq);
		chess::Color color = piece.color();
		chess::PieceType type = piece.type();

		int idx = getTableIndex(sq, color); // on get l'index sur lequel on est pour calculer l'avantage positionnel
		int value = PIECES_VALUES[type] + PIECES_TABLES[type][idx]; // on calcule l'avantage que cette PIECE nous apporte a cette POSITION

		if (color == chess::Color::WHITE)
			white_score += value; // on ajoute aux blancs si c'est une piece blanche
		else
			black_score += value; // on ajoute aux noirs si c'est une piece noire
	}

	white_score += getKingSecurity(board, chess::Color::WHITE);
	black_score += getKingSecurity(board, chess::Color::BLACK);

	return (white_score - black_score); // on recup la  diff
}

static int minimax(chess::Board &board, int depth, int alpha, int beta)
{
	if (depth == 0)
		return (getPositionScore(board));

	chess::Movelist	moves;
	chess::movegen::legalmoves(moves, board);
	
	if (moves.empty())
	{
		if (board.isGameOver().second == chess::GameResult::LOSE)
		return (board.sideToMove() == chess::Color::WHITE ? -100000 : 100000);
		return (0);
	}
	
	bool isWhite = board.sideToMove() == chess::Color::WHITE;

	if (isWhite)
	{
		int best = -100000;
		for (const auto &move : moves)
		{
			board.makeMove(move);
			int score = minimax(board, depth - 1, alpha, beta);
			board.unmakeMove(move);
			best = std::max(best, score);
			alpha = std::max(alpha, best);
			if (beta <= alpha)
				break ;
		}
		return (best);
	}
	else
	{
		int best = 100000;
		for (const auto &move : moves)
		{
			board.makeMove(move);
			int score = minimax(board, depth - 1, alpha, beta);
			board.unmakeMove(move);
			best = std::min(best, score);
			beta = std::min(beta, best);
			if (beta <= alpha)
				break ;
		}
		return (best);
	}
}

std::string	getIaMove(chess::Board &board, int depth, float errorChance)
{
	chess::Movelist moves;
	chess::movegen::legalmoves(moves, board);

	int searchDepth = depth;

	if ((float)rand() / RAND_MAX < errorChance)
		searchDepth = std::max(1, depth / 2);

	bool isWhite = board.sideToMove() == chess::Color::WHITE;
	chess::Move bestMove = moves[0];
	int bestScore = isWhite ? -100000 : 100000;
	for (const auto &move : moves)
	{
		board.makeMove(move);
		int score = minimax(board, searchDepth - 1, -100000, 100000);
		board.unmakeMove(move);
		if (isWhite && score > bestScore)
		{
			bestScore = score;
			bestMove = move;
		}
		if (!isWhite && score < bestScore)
		{
			bestScore = score;
			bestMove = move;
		}
	}

	return (chess::uci::moveToUci(bestMove));
}
