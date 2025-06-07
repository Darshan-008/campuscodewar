import User from '../models/user.js';

export const getLeaderboard = async (req, res) => {
    try {
        // Get all users with their solved problems and calculate scores
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'problems',
                    localField: 'solvedProblems',
                    foreignField: '_id',
                    as: 'solvedProblemDetails'
                }
            },
            {
                $addFields: {
                    problemsSolved: { $size: '$solvedProblemDetails' },
                    totalScore: {
                        $sum: {
                            $map: {
                                input: '$solvedProblemDetails',
                                as: 'problem',
                                in: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ['$$problem.difficulty', 'easy'] }, then: 10 },
                                            { case: { $eq: ['$$problem.difficulty', 'medium'] }, then: 20 },
                                            { case: { $eq: ['$$problem.difficulty', 'hard'] }, then: 30 }
                                        ],
                                        default: 0
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    userName: 1,
                    email: 1,
                    problemsSolved: 1,
                    totalScore: 1
                }
            },
            { $sort: { totalScore: -1, problemsSolved: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard data',
            error: error.message
        });
    }
};
            { $limit: 100 }
        ]);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
