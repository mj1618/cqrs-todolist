import Crumble from '../../src/crumble';
import createModels from '../../src/models';
import { suite, test, slow, timeout } from "mocha-typescript";
import chai = require('chai');
chai.should();

@suite class TodosDb {

    @test async should_add_todo_to_events_store(){
        let crumble = new Crumble(true);
        await createModels(crumble);
        await crumble.addEvent('todos', {
            action: 'create',
            uuid: crumble.uuid(),
            name: '1st Todo to do',
        });
        await crumble.updateReadModels();
        const events = await crumble.getEvents('todos');
        events.length.should.equal(1);
    }

    @test async should_add_todo_to_read_model(){
        let crumble = new Crumble(true);
        await createModels(crumble);
        await crumble.addEvent('todos', {
            action: 'create',
            uuid: crumble.uuid(),
            name: '1st Todo to do',
        });
        await crumble.updateReadModels();
        const state = await crumble.getReadModel('all-todos');
        state.length.should.equal(1);
    }

    @test async update_should_update_read_model(){
        let crumble = new Crumble(true);
        await createModels(crumble);
        const uuid = crumble.uuid();
        await crumble.addEvent('todos', {
            action: 'create',
            uuid,
            name: '1st Todo to do',
        });
        await crumble.updateReadModels();
        await crumble.addEvent('todos', {
            action: 'update',
            uuid,
            name: '1st Todo updated',
        });
        await crumble.updateReadModels();
        const state = await crumble.getReadModel('all-todos');
        state.length.should.equal(1);
        state[0].name.should.equal('1st Todo updated');
    }

    @test async delete_should_clear_read_model(){
        let crumble = new Crumble(true);
        await createModels(crumble);
        const uuid = crumble.uuid();
        await crumble.addEvent('todos', {
            action: 'create',
            uuid,
            name: '1st Todo to do',
        });
        await crumble.updateReadModels();
        await crumble.addEvent('todos', {
            action: 'delete',
            uuid,
        });
        await crumble.updateReadModels();
        const state = await crumble.getReadModel('all-todos');
        state.length.should.equal(0);
    }
}