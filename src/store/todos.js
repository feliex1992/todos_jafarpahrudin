import PouchyStore from 'pouchy-store';

class TodosStore extends PouchyStore {
  get name() {
    return this._name;
  }

  setName(userId) {
    this._name = `todos_${userId}`;
  }

  get urlRemote() {
    console.log("Url");
    return "http://13.250.43.79:5984/";
  }

  get optionsRemote() {
    console.log("Auth");
    return {
      auth: {
        username: 'admin',
        password: 'iniadmin',
      }
    };
  }

  sortData(data) {
    data.sort((one, two) => {
      const oneTs = one.createdAt;
      const twoTs = two.createdAt;
      if (oneTs > twoTs) return -1;
      if (oneTs < twoTs) return 1;
      return 0;
    });
  }

  async sync() {
    try {
      await this.upload();
      return Promise.resolve(true);
    } catch(e) {
      console.log('Sync failed due to conenction issue.');
      return Promise.resolve(false);
    }
  }

  async getTodos() {
    const todos = await this.fetchData();

    return Promise.resolve(todos.sort((todoA, todoB) => {
      return new Date(todoA.createdAt) - new Date(todoB.createdAt);
    }));
  }

  async fetchData(options = {}) {
    const res = await this.dbLocal.changes({
      live: false,
      include_docs: true,
      ...options,
    });

    const data = [];
    for (const result of res.results) {
      const doc = result.doc;
      if (doc._deleted) continue;
      if (doc.deletedAt) continue;
      data.push(doc);
    }

    return data;
  }
}

export default new TodosStore();
