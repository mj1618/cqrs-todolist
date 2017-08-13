export default (app, crumble) => {

    const itemExists = async id => {
        return (await crumble.getReadModel('all-todos')).some(t=>t.uuid===id);
    }

    app.get('/api/todos', async (req,res) => {
        res.json(await crumble.getReadModel('all-todos'));
    });

    app.put('/api/todos', async (req,res) => {
        await crumble.addEvent('todos', {
            action: 'create',
            uuid: crumble.uuid(),
            name: req.body.name
        });

        res.json({result: 'ok'});
    });

    app.post('/api/todos', async (req,res) => {
        if(await itemExists(req.body.uuid)){
            await crumble.addEvent('todos', {
                action: 'update',
                uuid: req.body.uuid,
                name: req.body.name
            });
            res.json({result: 'ok'});
        } else {
            res.json({result: 'error', reason: 'Item is not valid'});
        }
    });

    app.delete('/api/todos', async (req,res) => {
        if(await itemExists(req.body.uuid)){
            await crumble.addEvent('todos', {
                action: 'delete',
                uuid: req.body.uuid
            });
            res.json({result: 'ok'});
        } else {
            res.json({result: 'error', reason: 'Item is not valid'});
        }
    });
}