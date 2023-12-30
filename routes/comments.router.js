import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

// 댓글 등록 API (Create)
router.post('/reviews/:reviewId/comments', async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { content, author, password } = req.body;
        const review = await prisma.reviews.findUnique({
            where: { id: +reviewId }
        });
        if (!content || !author || !password) {
            return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        if (!review) {
            return res.status(404).json({ errorMessage: "존재하지 않는 리뷰입니다." });
        }
        const comment = await prisma.comments.create({
            data: { content, author, password, reviewId: +reviewId }
        });
        return res.status(201).json({ data: comment });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});

// 댓글 목록 조회 API (Read)
router.get('/reviews/:reviewId/comments', async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const review = await prisma.reviews.findMany({
            select: { // 아래에 특정 column 을 false 처리해서 안나오게 할 수 있지만, select 로 특정 column을 true로 설정하지 않으면 자동적으로 해당 column이 조회되지 않음
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
            },
            where: { id: +reviewId }
        });
        if (!reviewId) {
            return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        if (!review) {
            return res.status(404).json({ errorMessage: "존재하지 않는 리뷰입니다." });
        }

        const comment = await prisma.comments.findMany({
            select: {
                id: true,
                content: true,
                author: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            },

        });
        return res.status(200).json({ data: comment });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});

// 댓글 수정 API (Update)
router.put('/reviews/:reviewId/comments/:commentId', async (req, res, next) => {
    try {
        const { reviewId, commentId } = req.params;
        const { content, password } = req.body;
        const review = await prisma.reviews.findUnique({
            where: { id: +reviewId }
        });
        const comment = await prisma.comments.findUnique({
            where: { id: +commentId }
        });

        if (!content || !password) {
            return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        if (!comment) {
            return res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요." });
        }
        if (!review) {
            return res.status(404).json({ errorMessage: "존재하지 않는 리뷰입니다." });
        } else if (comment.password !== password) {
            return res.status(401).json({ errorFormat: "비밀번호가 일치하지 않습니다." });
        }

        await prisma.comments.update({
            where: {
                id: +commentId
            },
            data: { content, updatedAt: new Date() }
        });
        return res.status(200).json({ data: "댓글을 수정하였습니다." });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});

// 댓글 삭제 API (Delete)
router.delete('/reviews/:reviewId/comments/:commentId', async (req, res, next) => {
    try {
        const { reviewId, commentId } = req.params;
        const { password } = req.body;
        const review = await prisma.reviews.findUnique({
            where: { id: +reviewId }
        });
        const comment = await prisma.comments.findUnique({
            where: { id: +commentId }
        });
        if (!password) {
            return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        if (!review) {
            return res.status(404).json({ errorMessage: "존재하지 않는 리뷰입니다." });
        } else if (comment.password !== password) { // 게시글의 비멀번호와 전달받은 비밀번호가 다를 때
            return res.status(401).json({ errorFormat: "비밀번호가 일치하지 않습니다." });
        }
        // 5. 모든 조건을 통과하였다면 **게시글을 삭제**합니다.
        await prisma.comments.delete({
            where: {
                id: +commentId,
            }
        })
        return res.status(200).json({ data: "댓글 삭제가 완료되었습니다." });
    } catch (error) { return res.status(400).json({ errorMessage: error }) };
});


export default router;