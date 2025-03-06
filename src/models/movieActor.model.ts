import { Actor } from "./actor.model";

export interface MovieActor {
    movieActorId: number;
    movieId: number;
    actorId: number;
    actor: Actor;
  }
  