import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.


// 리뷰 등록 API (Create)

router.post('/reviews', async (req, res, next) => {
    try {
        const { bookTitle, title, content, starRating, author, password } = req.body;
        const review = await prisma.reviews.create({
            data: { bookTitle, title, content, starRating, author, password }
        });

        return res.status(201).json({ data: review });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});

// 리뷰 목록 조회 API (Read 1)
router.get('/reviews', async (req, res, next) => {
    try {
        const reviews = await prisma.reviews.findMany({
            select: { // 아래에 특정 column 을 false 처리해서 안나오게 할 수 있지만, select 로 특정 column을 true로 설정하지 않으면 자동적으로 해당 column이 조회되지 않음
                id: true,
                bookTitle: true,
                title: true,
                author: true,
                starRating: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return res.status(200).json({ data: reviews });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});

// 리뷰 상세 조회 API (Read 2)
router.get('/reviews/:reviewId', async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const review = await prisma.reviews.findFirst({
            where: { id: +reviewId }, // 스키마에서는 postId를 int로 받아야하는데, 그냥하면 문자열로 받아버려서 에러남. 그래서 +를 붙혀서 정수타입으로 바꿔줘야함!
            select: {
                id: true,
                bookTitle: true,
                title: true,
                content: true,
                author: true,
                starRating: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        return res.status(200).json({ data: review });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});

// 리뷰 수정 API (Update)
router.put('/reviews/:reviewId', async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { bookTitle, title, content, starRating, password } = req.body;
        if (!reviewId || !bookTitle || !title || !content || !starRating || !password) {
            return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }

        const review = await prisma.reviews.findUnique({
            where: { id: +reviewId }
        });

        if (!review) {
            return res.status(404).json({ errorMessage: "존재하지 않는 리뷰입니다." });
        } else if (review.password !== password) { // 게시글의 비멀번호와 전달받은 비밀번호가 다를 때
            return res.status(401).json({ errorFormat: "비밀번호가 일치하지 않습니다." });
        }

        await prisma.reviews.update({
            data: { bookTitle, title, content, starRating, password },
            where: {
                id: +reviewId,
                password
            }
        })
        return res.status(200).json({ data: "책 리뷰를 수정하였습니다." });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});

// 리뷰 삭제 API (Delete)
router.delete('/reviews/:reviewId', async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { password } = req.body;
        if (!reviewId || !password) {
            return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        const review = await prisma.reviews.findUnique({
            where: { id: +reviewId }
        });
        if (!review) {
            return res.status(404).json({ errorMessage: "존재하지 않는 리뷰입니다." });
        } else if (review.password !== password) { // 게시글의 비멀번호와 전달받은 비밀번호가 다를 때
            return res.status(401).json({ errorFormat: "비밀번호가 일치하지 않습니다." });
        }
        // 5. 모든 조건을 통과하였다면 **게시글을 삭제**합니다.
        await prisma.reviews.delete({
            where: {
                id: +reviewId,
            }
        })
        return res.status(200).json({ data: "게시글 삭제가 완료되었습니다." });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});

export default router;