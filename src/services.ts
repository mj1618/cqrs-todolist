export default (app, crumble) => {

    const itemExists = async id => {
        return (await crumble.getReadModel('all-todos')).some(t=>t.uuid===id);
    }

    app.get('/todos', async (req,res) => {
        res.json(await crumble.getReadModel('all-todos'));
    });

    app.put('/todos/create', async (req,res) => {
        await crumble.addEvent('items', {
            action: 'create',
            uuid: crumble.uuid(),
            name: req.query.name
        });

        res.json({result: 'ok'});
    });

    app.post('/todos/{itemId}/update', async (req,res) => {
        if(await itemExists(req.params.itemId)){
            await crumble.addEvent('items', {
                action: 'update',
                id: req.params.itemId,
                name: req.query.name
            });
            res.json({result: 'ok'});
        } else {
            res.json({result: 'error', reason: 'Item is not valid'});
        }
    });

    app.delete('/todos/{itemId}/delete', async (req,res) => {
        if(await itemExists(req.params.itemId)){
            await crumble.addEvent('items', {
                action: 'delete',
                id: req.params.itemId
            });
            res.json({result: 'ok'});
        } else {
            res.json({result: 'error', reason: 'Item is not valid'});
        }
    });
}