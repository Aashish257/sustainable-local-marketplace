import * as service from "./notification.service.js";

export const getNotifications = async (req, res, next) => {
    try {
        res.json({ success: true, data: await service.listNotifications(req.user.id, req.query) });
    } catch (err) { next(err); }
};

export const readOne = async (req, res, next) => {
    try {
        res.json({ success: true, data: await service.markRead(req.user.id, req.params.id) });
    } catch (err) { next(err); }
};

export const readAll = async (req, res, next) => {
    try {
        const r = await service.markAllRead(req.user.id);
        res.json({ success: true, data: { updated: r.modifiedCount } });
    } catch (err) { next(err); }
};

export const removeAll = async (req, res, next) => {
    try {
        const r = await service.clearAll(req.user.id);
        res.json({ success: true, data: { deleted: r.deletedCount } });
    } catch (err) { next(err); }
};
