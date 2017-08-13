export default async (crumble)=> {
    await crumble.createEventStore('todos');
    await crumble.createReadModel('all-todos', 'todos', [], (state, event)=>{
        switch(event.action){
            case 'create':
                if(!state.some(todo=>todo.get('uuid')===event.uuid)){
                    return state.push({
                        uuid: event.uuid,
                        name: event.name,
                    });
                }
                break;
            case 'update':
                if(state.some(todo=>todo.get('uuid')===event.uuid)){
                    return state.filter(todo=>todo.get('uuid')!==event.uuid).push({
                        uuid: event.uuid,
                        name: event.name,
                    });
                }
                break;
            case 'delete':
                if(state.some(todo=>todo.get('uuid')===event.uuid)){
                    return state.filter(todo=>todo.get('uuid')!==event.uuid);
                }
                break;
        }
        return state;
    });
}