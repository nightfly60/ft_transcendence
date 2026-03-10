#include "ia.hpp"

static int	evalPosition(const chess::Board &board)
{
	int score = 0;
	for (int i = 0; i < 64; ++i)
	{
		chess::Square sq = chess::Square(i);
		chess::Piece piece = board.at(sq);
		if (piece == chess::Piece::NONE)
			continue ;
		int value = 0;
		switch (piece.type().internal())
		{
			case chess::PieceType::PAWN:
				value = 100;
				break ;
			case chess::PieceType::KNIGHT:
				value = 300;
				break ;
			case chess::PieceType::BISHOP:
				value = 300;
				break ;
			case chess::PieceType::ROOK:
				value = 500;
				break ;
			case chess::PieceType::QUEEN:
				value = 900;
			default:
				break ;
		}
		score += piece.color() == chess::Color::WHITE ? value : -value;
	}
	score += ((float)rand() / RAND_MAX - 0.5f) * 0.f;
	return (score);
}

static int minimax(chess::Board &board, int depth, int alpha, int beta)
{
	if (depth == 0)
		return (evalPosition(board));

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
			alpha = std::min(beta, best);
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

	if ((float)rand() / RAND_MAX < errorChance)
	{
		int randomIndex = rand() % moves.size();
		return (chess::uci::moveToUci(moves[randomIndex]));
	}

	bool isWhite = board.sideToMove() == chess::Color::WHITE;
	chess::Move bestMove = moves[0];
	int bestScore = isWhite ? -100000 : 100000;
	for (const auto &move : moves)
	{
		board.makeMove(move);
		int score = minimax(board, depth - 1, -100000, 100000);
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
