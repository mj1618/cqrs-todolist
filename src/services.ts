export default (app, crumble) => {

    const itemExists = id => {
        return crumble.getState('todos').some(t=>t.uuid===id);
    }

    app.get('/todos', (req,res) => {
        return crumble.getState('todos');
    });

    app.put('/todos/create', (req,res) => {
        crumble.addEvent('items', {
            action: 'create',
            uuid: crumble.uuid(),
            name: req.query.name
        });

        res.json({result: 'ok'});
    });

    app.post('/todos/{itemId}/update', (req,res) => {
        if(itemExists(req.params.itemId)){
            crumble.addEvent('items', {
                action: 'update',
                id: req.params.itemId,
                name: req.query.name
            });
            res.json({result: 'ok'});
        } else {
            res.json({result: 'error', reason: 'Item is not valid'});
        }
    });

    app.delete('/todos/{itemId}/delete', (req,res) => {
        if(itemExists(req.params.itemId)){
            crumble.addEvent('items', {
                action: 'delete',
                id: req.params.itemId
            });
            res.json({result: 'ok'});
        } else {
            res.json({result: 'error', reason: 'Item is not valid'});
        }
    });
}