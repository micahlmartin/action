import Database from './database';
import { subscriptions } from './helpers/subscriptions';
import { publish } from '../socketio/index';

const type = Database.type;

export const Meeting = Database.createModel('Meeting', {
  id: type.string(),
  createdAt: type.date().default(Database.r.now()),
  updatedAt: type.date(),
  updatedBy: type.string().default(''),
  content: type.string().default(''),
  editing: type.boolean().default(false)
});

function preHook(next) {
  this.updatedAt = Database.r.now();
  next();
}

Meeting.pre('save', preHook);

function subscribe(io, room, params, modelPath) {
  console.log(`Meeting.subscribe() --> ${room}`);
  if (subscriptions.exists(modelPath, params)) {
    console.log(`Meeting.subscribe() --> exists! adding to ${room}`);
    subscriptions.addRoomTo(modelPath, params, room);
    return;
  }
  const { id } = params;
  this.get(id).changes().then( (cursor) => {
    console.log(`Meeting.add() --> ${room}`);
    subscriptions.add(modelPath, params, cursor);
    subscriptions.addRoomTo(modelPath, params, room);
    cursor.on('change', (doc) => {
      const rooms = subscriptions.getRoomsFor(modelPath, params);
      console.log(`Meeting.publish() --> ${rooms}`);
      publish(io, rooms, modelPath, doc, doc.updatedBy);
    });
  });
}

Meeting.defineStatic('subscribe', subscribe);

function unsubscribe(room, params, modelPath) {
  if (!subscriptions.exists(modelPath, params)) {
    console.log(`Meeting.unsubscribe() --> DOES NOT EXIST!`);
    return;
  }

  // Unsubscribe the room:
  const remainingRooms = subscriptions.removeRoomFrom(modelPath, params, room);
  console.log(`Meeting.unsubscribe() --> remainingRooms = ${remainingRooms}`);

  if (remainingRooms.length === 0) {
    const cursor = subscriptions.lookup(modelPath, params).cursor;
    // Turn off the model subscription:
    console.log(`Meeting.unsubscribe()`);
    subscriptions.remove(modelPath, params);
    // Stop the database change feed:
    cursor.close();
  }
}

Meeting.defineStatic('unsubscribe', unsubscribe);

export default Meeting;
