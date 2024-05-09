import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {DataSource} from "../../../src/data-source/DataSource"
import {expect} from "chai";
import {User} from "./entity/user";
import {Ingredient} from "./entity/ingredient";

describe("github issues > #10834 Cannot find record in table if it has relation to another table", () => {

    let dataSources: DataSource[];
    before(async () => dataSources = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        enabledDrivers: ["postgres"],
        schemaCreate: true,
        dropSchema: true,
    }));
    beforeEach(() => reloadTestingDatabases(dataSources));
    after(() => closeTestingConnections(dataSources));

    it("should return ingredient with assigned author when both author and deletedAt are set and withDeleted is true", () => Promise.all(dataSources.map(async dataSource => {
        const user = await dataSource.getRepository(User).save({id: 1});
        await dataSource.getRepository(Ingredient).save({
            id: 1,
            author: user,
            deletedAt: new Date()
        });
        const foundIngredient = await dataSource.getRepository(Ingredient).findOne({withDeleted: true, where: {id: 1}});
        expect(foundIngredient?.author).to.be.eql(user);
    })));



    it("should return author when ingredient is found withDeleted true after softRemove", () => Promise.all(dataSources.map(async dataSource => {
        const user = await dataSource.getRepository(User).save({id: 1});
        await dataSource.getRepository(Ingredient).save({
            id: 1,
            author: user,
        });
        await dataSource.getRepository(Ingredient).softRemove({id: 1});
        const foundIngredient = await dataSource.getRepository(Ingredient).findOne({withDeleted: true, where: {id: 1}});
        expect(foundIngredient?.author).to.be.eql(user);
    })));

    it("should return author null when ingredient is found withDeleted true after remove of author", () => Promise.all(dataSources.map(async dataSource => {
        const user = await dataSource.getRepository(User).save({id: 1});
        await dataSource.getRepository(Ingredient).save({
            id: 1,
            author: user,
        });
        await dataSource.getRepository(User).remove({id: 1});
        const foundIngredient = await dataSource.getRepository(Ingredient).findOne({withDeleted: true, where: {id: 1}});
        expect(foundIngredient?.author).to.be.eql(null);
    })));
});
