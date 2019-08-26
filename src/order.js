const myDb = require('../db/index.js');
const { dbGet, dbRun, dbAll } = myDb;

function getOrders(db) {
	return async (req, res, next) => {
		try {
			const q = 'SELECT * from order_table';
			const rows = await dbAll(db, q, []);
			res.json({
				success: true,
				items: rows,
			});
		} catch (error) {
			next(error);
		}
	};
}

function getOrder(db) {
	return async (req, res, next) => {
		try {
			const { id } = req.params;
			const q = 'SELECT * from order_table WHERE id = ? LIMIT 1';
			const row = await dbGet(db, q, [id]);

			if (row) {
				res.json({
					success: true,
					items: row,
				});
			} else {
				res.json({
					success: false,
					message: 'Item could not be found',
				});
			}
		} catch (error) {
			next(error);
		}
	};
}

function postOrder(db) {
	return async (req, res, next) => {
		try {
			if (!req.body) {
				res.json({
					success: false,
					message: 'Invalid request',
				});
				return;
			}

			const { itemId, quantity } = req.body;
			if (itemId === null || quantity === null) {
				res.json({
					success: false,
					message: 'Invalid request',
				});
				return;
			}
			const row = await dbGet(db, 'SELECT stock from item where id = ?', [
				itemId,
			]);

			if (!row) {
				res.json({
					success: false,
					message: 'Item could not be found',
				});
				return;
			}

			if (row.stock < quantity) {
				res.json({
					success: false,
					message: 'Item does not have enough stock',
				});
				return;
			}

			const { lastID } = await dbRun(
				db,
				'INSERT INTO order_table(itemId, quantity) values (?,?)',
				[itemId, quantity],
			);

			const order = await dbGet(
				db,
				'SELECT id, * from order_table where id = ?',
				[lastID],
			);
			res.json({ success: true, order: order });
		} catch (error) {
			next(error);
		}
	};
}

exports.getOrders = getOrders;
exports.getOrder = getOrder;
exports.postOrder = postOrder;
