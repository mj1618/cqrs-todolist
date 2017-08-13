var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
System.register("crumble", ["node-uuid", "knex"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var uuid, knex_1, immutable, List, fromJS, DBStore, SimpleStore, ReadModels, Crumble;
    return {
        setters: [
            function (uuid_1) {
                uuid = uuid_1;
            },
            function (knex_1_1) {
                knex_1 = knex_1_1;
            }
        ],
        execute: function () {
            immutable = require('immutable');
            List = immutable.List, fromJS = immutable.fromJS;
            DBStore = (function () {
                function DBStore() {
                    this.knex = knex_1["default"]({
                        client: 'pg',
                        connection: {
                            host: '127.0.0.1',
                            user: 'postgres',
                            password: 'postgres',
                            database: 'todo_app'
                        }
                    });
                }
                DBStore.prototype.createEventStore = function (eventStore) {
                    return this.knex.schema.withSchema('crumble').createTableIfNotExists(eventStore + "_events", function (table) {
                        table.increments();
                        table.json('event');
                    });
                };
                DBStore.prototype.createReadModel = function (readModel, initialState) {
                    var _this = this;
                    return this.knex.schema.withSchema('crumble').createTableIfNotExists(readModel + "_read_model", function (table) {
                        table.increments();
                        table.integer('last_id');
                        table.index('last_id');
                        table.json('state');
                    }).then(function () {
                        _this.snapshot(readModel, initialState);
                    });
                };
                DBStore.prototype.add = function (eventStore, event) {
                    return this.knex.table('${eventStore}_events').insert({ event: event });
                };
                DBStore.prototype.readEvents = function (eventStore, from) {
                    if (from === void 0) { from = 0; }
                    return this.knex.select().from('${eventStore}_events').where('id', '>', from);
                };
                DBStore.prototype.snapshot = function (readModelName, state, lastId) {
                    if (lastId === void 0) { lastId = 0; }
                    return this.knex.table(readModelName + "_read_model").insert({
                        last_id: lastId,
                        state: state
                    });
                };
                DBStore.prototype.latestSnapshot = function (readModelName) {
                    return this.knex.table(readModelName + "_read_model").orderBy('id', 'desc').first();
                };
                return DBStore;
            }());
            exports_1("DBStore", DBStore);
            SimpleStore = (function () {
                function SimpleStore() {
                    this.tables = {};
                }
                SimpleStore.prototype.createEventStore = function (eventStore) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.tables[eventStore + "_events"] = [];
                            return [2 /*return*/, Promise.resolve()];
                        });
                    });
                };
                SimpleStore.prototype.createReadModel = function (readModel, initialState) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.tables[readModel + "_read_model"] = [];
                            return [2 /*return*/, this.snapshot(readModel, initialState)];
                        });
                    });
                };
                SimpleStore.prototype.add = function (eventStore, event) {
                    return __awaiter(this, void 0, void 0, function () {
                        var eventsTable;
                        return __generator(this, function (_a) {
                            eventsTable = this.tables[eventStore + "_events"];
                            eventsTable.push({
                                id: this.nextId(eventsTable),
                                event: event
                            });
                            return [2 /*return*/, Promise.resolve()];
                        });
                    });
                };
                SimpleStore.prototype.nextId = function (table) {
                    if (table.length === 0) {
                        return 1;
                    }
                    else {
                        return table[table.length - 1].id + 1;
                    }
                };
                SimpleStore.prototype.readEvents = function (eventStore, from) {
                    if (from === void 0) { from = 0; }
                    return __awaiter(this, void 0, void 0, function () {
                        var events;
                        return __generator(this, function (_a) {
                            events = this.tables[eventStore + "_events"].filter(function (e) { return e.id >= from; });
                            return [2 /*return*/, Promise.resolve(events)];
                        });
                    });
                };
                SimpleStore.prototype.snapshot = function (readModelName, state, lastId) {
                    if (lastId === void 0) { lastId = 0; }
                    return __awaiter(this, void 0, void 0, function () {
                        var readModelTable;
                        return __generator(this, function (_a) {
                            readModelTable = this.tables[readModelName + "_read_model"];
                            readModelTable.push({
                                id: this.nextId(readModelTable),
                                last_id: lastId,
                                state: state
                            });
                            return [2 /*return*/, Promise.resolve()];
                        });
                    });
                };
                SimpleStore.prototype.latestSnapshot = function (readModelName) {
                    return __awaiter(this, void 0, void 0, function () {
                        var readModelTable;
                        return __generator(this, function (_a) {
                            readModelTable = this.tables[readModelName + "_read_model"];
                            return [2 /*return*/, Promise.resolve(readModelTable[readModelTable.length - 1])];
                        });
                    });
                };
                return SimpleStore;
            }());
            exports_1("SimpleStore", SimpleStore);
            ReadModels = (function () {
                function ReadModels(store) {
                    this.models = [];
                    this.store = store;
                }
                ReadModels.prototype.create = function (name, eventStore, initialState, fn) {
                    this.store.createReadModel(name, initialState);
                    this.models.push({
                        name: name,
                        eventStore: eventStore,
                        fn: fn
                    });
                };
                ReadModels.prototype.get = function (name) {
                    return __awaiter(this, void 0, void 0, function () {
                        var model;
                        return __generator(this, function (_a) {
                            model = this.models.find(function (m) { return m.name === name; });
                            if (!model) {
                                console.log("cannot find model \"" + name + "\"");
                                return [2 /*return*/, Promise.resolve()];
                            }
                            else {
                                return [2 /*return*/, this.store.latestSnapshot(model.name).then(function (snap) { return snap.state; })];
                            }
                            return [2 /*return*/];
                        });
                    });
                };
                ReadModels.prototype.updateAll = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            return [2 /*return*/, Promise.all(this.models.map(function (m) { return _this.update(m); }))];
                        });
                    });
                };
                ReadModels.prototype.update = function (model) {
                    return __awaiter(this, void 0, void 0, function () {
                        var snapshot, events, state, lastId;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.store.latestSnapshot(model.name)];
                                case 1:
                                    snapshot = _a.sent();
                                    return [4 /*yield*/, this.store.readEvents(model.eventStore, snapshot.last_id + 1)];
                                case 2:
                                    events = _a.sent();
                                    if (events.length > 0) {
                                        state = events.map(function (e) { return e.event; }).reduce(model.fn, fromJS(snapshot.state));
                                        lastId = events[events.length - 1].id;
                                        return [2 /*return*/, this.store.snapshot(model.name, state.toJS(), lastId)];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                return ReadModels;
            }());
            Crumble = (function () {
                function Crumble(simple) {
                    if (simple === void 0) { simple = false; }
                    this.store = simple ? new SimpleStore() : new DBStore();
                    this.readModels = new ReadModels(this.store);
                }
                Crumble.prototype.uuid = function () {
                    return uuid.v4();
                };
                Crumble.prototype.createEventStore = function (name) {
                    return this.store.createEventStore(name);
                };
                Crumble.prototype.createReadModel = function (name, eventStore, initialState, fn) {
                    return this.readModels.create(name, eventStore, initialState, fn);
                };
                Crumble.prototype.getReadModel = function (name) {
                    return this.readModels.get(name);
                };
                Crumble.prototype.addEvent = function (model, event) {
                    return this.store.add(model, event);
                };
                Crumble.prototype.updateReadModels = function () {
                    return this.readModels.updateAll();
                };
                Crumble.prototype.getEvents = function (eventStore, from) {
                    if (from === void 0) { from = 0; }
                    return this.store.readEvents(eventStore, from);
                };
                return Crumble;
            }());
            exports_1("default", Crumble);
        }
    };
});
System.register("services", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            exports_2("default", function (app, crumble) {
                var itemExists = function (id) {
                    return crumble.getState('todos').some(function (t) { return t.uuid === id; });
                };
                app.get('/todos', function (req, res) {
                    return crumble.getState('todos');
                });
                app.put('/todos/create', function (req, res) {
                    crumble.addEvent('items', {
                        action: 'create',
                        uuid: crumble.uuid(),
                        name: req.query.name
                    });
                    res.json({ result: 'ok' });
                });
                app.post('/todos/{itemId}/update', function (req, res) {
                    if (itemExists(req.params.itemId)) {
                        crumble.addEvent('items', {
                            action: 'update',
                            id: req.params.itemId,
                            name: req.query.name
                        });
                        res.json({ result: 'ok' });
                    }
                    else {
                        res.json({ result: 'error', reason: 'Item is not valid' });
                    }
                });
                app["delete"]('/todos/{itemId}/delete', function (req, res) {
                    if (itemExists(req.params.itemId)) {
                        crumble.addEvent('items', {
                            action: 'delete',
                            id: req.params.itemId
                        });
                        res.json({ result: 'ok' });
                    }
                    else {
                        res.json({ result: 'error', reason: 'Item is not valid' });
                    }
                });
            });
        }
    };
});
System.register("models", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            exports_3("default", function (crumble) {
                crumble.createEventStore('todos');
                crumble.createReadModel('all-todos', 'todos', [], function (state, event) {
                    switch (event.action) {
                        case 'create':
                            if (!state.some(function (todo) { return todo.get('uuid') === event.uuid; })) {
                                return state.push({
                                    uuid: event.uuid,
                                    name: event.name
                                });
                            }
                            break;
                        case 'update':
                            if (state.some(function (todo) { return todo.get('uuid') === event.uuid; })) {
                                return state.filter(function (todo) { return todo.get('uuid') !== event.uuid; }).push({
                                    uuid: event.uuid,
                                    name: event.name
                                });
                            }
                            break;
                        case 'delete':
                            if (state.some(function (todo) { return todo.get('uuid') === event.uuid; })) {
                                return state.filter(function (todo) { return todo.get('uuid') !== event.uuid; });
                            }
                            break;
                    }
                    return state;
                });
            });
        }
    };
});
System.register("index", ["services", "models", "crumble", "express", "body-parser", "morgan"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var services_1, models_1, crumble_1, express_1, body_parser_1, morgan_1, app, crumble;
    return {
        setters: [
            function (services_1_1) {
                services_1 = services_1_1;
            },
            function (models_1_1) {
                models_1 = models_1_1;
            },
            function (crumble_1_1) {
                crumble_1 = crumble_1_1;
            },
            function (express_1_1) {
                express_1 = express_1_1;
            },
            function (body_parser_1_1) {
                body_parser_1 = body_parser_1_1;
            },
            function (morgan_1_1) {
                morgan_1 = morgan_1_1;
            }
        ],
        execute: function () {
            app = express_1["default"]();
            app.use(morgan_1["default"]('combined'));
            app.use(body_parser_1["default"].urlencoded({ extended: true }));
            app.use(body_parser_1["default"].json());
            app.use(express_1["default"].static('./public'));
            crumble = new crumble_1["default"]();
            models_1["default"](crumble);
            services_1["default"](app, crumble);
            app.listen(3000, function () { return console.log('listening on port 3000!'); });
        }
    };
});
