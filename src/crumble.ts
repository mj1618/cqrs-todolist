import uuid = require('node-uuid');
import knex = require('knex');
const immutable = require('immutable');
const {List, fromJS} = immutable;

export class DBStore {

    knex: any;

    constructor(){
        this.knex = knex({
          client: 'pg',
          connection: {
            host : '127.0.0.1',
            user : 'postgres',
            password : 'postgres',
            database : 'todo_app'
          }
        });
    }

    async createEventStore(eventStore){
        await this.knex.raw('create schema if not exists crumble');
        await this.knex.schema.withSchema('crumble').createTableIfNotExists(`${eventStore}_events`, function (table) {
            table.increments();
            table.json('event');
        });
    }

    async createReadModel(readModel, initialState){
        this.knex.raw('create schema if not exists "crumble"');
        await this.knex.schema.withSchema('crumble').createTableIfNotExists(`${readModel}_read_model`, function (table) {
            table.increments();
            table.integer('last_id');
            table.json('state');
        })
        await this.snapshot(readModel, initialState);
    }

    async add(eventStore, event){
        await this.knex.withSchema('crumble').table(`${eventStore}_events`).insert({event:JSON.stringify(event)});
    }

    async readEvents(eventStore, from=0){
        return await this.knex.withSchema('crumble').select().from(`${eventStore}_events`).where('id','>=',from);
    }

    async snapshot(readModelName, state, lastId=0){
        await this.knex.withSchema('crumble').table(`${readModelName}_read_model`).insert({
            last_id: lastId,
            state: JSON.stringify(state),
        });
    }

    async latestSnapshot(readModelName){
        return this.knex.withSchema('crumble').table(`${readModelName}_read_model`).orderBy('id','desc').first();
    }
}

export class SimpleStore {
    tables: any;
    constructor(){
        this.tables={};
    }

    async createEventStore(eventStore){
        this.tables[`${eventStore}_events`] = [];
    }

    async createReadModel(readModel, initialState){
        this.tables[`${readModel}_read_model`] = [];
        return this.snapshot(readModel, initialState);
    }

    async add(eventStore, event){
        const eventsTable = this.tables[`${eventStore}_events`];
        eventsTable.push({
            id: this.nextId(eventsTable),
            event
        });
    }

    nextId(table){
        if(table.length===0){
            return 1;
        } else {
            return table[table.length-1].id+1;
        }
    }

    async readEvents(eventStore, from=0){
        const events = this.tables[`${eventStore}_events`].filter(e=>e.id>=from)
        return events;
    }

    async snapshot(readModelName, state, lastId=0){
        const readModelTable = this.tables[`${readModelName}_read_model`];
        readModelTable.push({
            id: this.nextId(readModelTable),
            last_id: lastId,
            state: state,
        });
    }

    async latestSnapshot(readModelName){
        const readModelTable = this.tables[`${readModelName}_read_model`];
        return readModelTable[readModelTable.length-1];
    }
}


class ReadModels {
    models: any;
    store: any;

    constructor(store){
        this.models=[];
        this.store = store;
    }

    async create(name, eventStore, initialState, fn){
        await this.store.createReadModel(name, initialState);
        await this.models.push({
            name, 
            eventStore,
            fn
        });
    }

    async get(name){
        const model = this.models.find(m=>m.name===name);
        if(!model){
            console.log(`cannot find model "${name}"`);
        } else {
            return this.store.latestSnapshot(model.name).then(snap=>snap.state);
        }
    }

    async updateAll(){
        return Promise.all(this.models.map(m=>this.update(m)));
    }

    async update(model){
        const snapshot = await this.store.latestSnapshot(model.name);
        const events = await this.store.readEvents(model.eventStore, snapshot.last_id+1);
        if(events.length>0){
            const state = events.map(e=>e.event).reduce(model.fn, fromJS(snapshot.state));
            const lastId = events[events.length-1].id;
            return this.store.snapshot(model.name, state.toJS(), lastId);
        }
    }
}

export default class Crumble {
    readModels: any;
    store: any;
    constructor(simple=false){
        this.store = simple ? new SimpleStore() : new DBStore();
        this.readModels = new ReadModels(this.store);
    }
    uuid(){
        return uuid.v4();
    }

    async createEventStore(name){
        await this.store.createEventStore(name);
    }

    async createReadModel(name, eventStore, initialState, fn){
        await this.readModels.create(name, eventStore, initialState, fn);
    }

    async getReadModel(name){
        return this.readModels.get(name);
    }

    async addEvent(model, event){
        await this.store.add(model, event);
    }

    async updateReadModels(){
        await this.readModels.updateAll();
    }

    async getEvents(eventStore, from=0){
        return await this.store.readEvents(eventStore, from);
    }
}
