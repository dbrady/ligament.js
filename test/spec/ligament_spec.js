describe("Ligament", function () {
  var Note;
  var Notes;
  var notes;

  var Owner;
  var Owners;
  var owners;

  var Company;
  var Companies;
  var companies;

  beforeEach(function() {
    Note = Ligament.Model.extend();
    Notes = Ligament.Collection.extend({model: Note});

    Owner = Ligament.Model.extend();
    Owners = Ligament.Collection.extend({model: Owner});

    Company = Ligament.Model.extend();
    Companies = Ligament.Collection.extend({model: Company});

    owners = new Owners([{id: 42
                          , name: "Bob from Accounting"
                          , company_id: 64}]);

    notes = new Notes([{id: 1
                        , text: "Please submit your TPS reports"
                        , owner_id: 42}]);

    companies = new Companies([{id: 64
                                , name: "Initech"}]);
  });

  describe("sanity check", function () {
    it("should extend Backbone with associations", function () {
      expect(notes).toBeDefined();
      expect(notes.get(1)).toBeDefined();
    });

    it("should rerpesent Backbone models correctly", function () {
      expect(notes.get(1).get('text')).toEqual("Please submit your TPS reports");
      var company_name = companies.get(owners.get(notes.get(1).get('owner_id')).get('company_id')).get('name')
      expect(company_name).toEqual('Initech');
    });
  });

  describe("registerModel", function () {
    beforeEach(function () {
      Ligament.registerModel("Note", Note);
      Ligament.registerModel("Owner", Owner);
      Ligament.registerModel("Company", Company);
    });

    it ("should register models", function () {
      expect(Ligament.models["Note"]).toEqual(Note);
    });

    it ("should make models know their own name", function () {
      expect(Note.prototype.modelName).toEqual("Note");
    });
  });

  describe("registerCollection", function () {
    beforeEach(function () {
      Ligament.registerCollection("notes", notes);
      Ligament.registerCollection("owners", owners);
      Ligament.registerCollection("companies", companies);
    });

    it ("should register collections", function () {
      expect(Ligament.collections["notes"]).toEqual(notes);
    });

    it ("should make collections know their own name", function () {
      expect(companies.prototype.collectionName).toEqual("companies");
    });
  });

  describe("associations", function ()  {
    beforeEach(function () {
      Ligament.registerModel("Note", Note);
      Ligament.registerModel("Owner", Owner);
      Ligament.registerModel("Company", Company);

      Ligament.registerCollection("notes", notes);
      Ligament.registerCollection("owners", owners);
      Ligament.registerCollection("companies", companies);
    });

    describe("belongsTo", function () {
      beforeEach(function () {
        Ligament.Model.belongsTo("Note", "owner", "owners", "owner_id");
      });

      it ("should return associated object", function () {
        expect(notes.get(1).get('owner_id')).toEqual(42);
        expect(notes.get(1).get('owner')).toEqual(owners.get(42));
      });
    });

    describe("delegatesTo", function() {
      beforeEach(function() {
        Ligament.Model.belongsTo("Note", "owner", "owners", "owner_id");
        Ligament.Model.delegatesTo("Note", "owner_name", "owner", "name");
      });

      it ("should delegate named property to foreign object", function () {
        expect(notes.get(1).get("owner_name")).toEqual("Bob from Accounting");
      });

      describe("with multiple layers of delegation and association", function() {
        beforeEach(function() {
          Ligament.Model.belongsTo("Owner", "company", "companies", "company_id");
          Ligament.Model.delegatesTo("Owner", "company_name", "company", "name");

          Ligament.Model.delegatesTo("Note", "company_name", "owner", "company_name");
        });

        it ("should delegate recursively", function () {
          expect(notes.get(1).get("company_name")).toEqual("Initech");
        });
      });
    });



  });


// registerModels
// registerCollections
// getAssociations

});



