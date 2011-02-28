# ligament.js #
An extension built on Backbone.js that adds joins and relations to
Backbone.Models. Instead of having to write

    var note = notes.get(1);
    var owner = owners.get(note.get('owner_id'));
    var owner_name = owner.get('name');

You can simply write

    var owner_name = notes.get(1).get('owner').get('name');

Or even

    var owner_name = notes.get(1).get('owner_name');

# Why? #

Because we needed to export a large database into a javascript file,
and porting it to 4th, 5th or even 6th normal form (not counting the
id column) helped us greatly compress out data. The drawback was that
what had been a single joined record was now in five different
Backbone models.

# Requirements #
This initial attempt at ligament.js was built against backbone.js
0.3.3, which depends on jQuery and underscore.js. Backbone.js does not
say which version of jQuery and underscore they require. I developed
against jQuery 1.5.0 and Underscore 1.1.4.

# Tests #
Just open test/SpecRunner.html in a browser and you're in business.
You do not need a server, just open the file directly.

Unit tests are found in the test/ folder. I used Jasmine to test
because the syntax is pretty and because it's totally self-contained.
I used Jasmine 1.0.1.

# Usage #

The DSL is still in flux. I'm trying to stay transparently compatible
with Backbone.js, so the DSL adds extra attributes to Models instead
of adding custom methods.

Currently setting up relationships is a bit laborious: you must
register each Model and Collection separately. (If anyone knows some
metaprogramming magic to get around this, please let me know.) I plan
to add "convention over configuration" eventually, in stages. Right
now this very early version must be configured explicitly.

For usage examples, let's say we have Notes that are owned by Owners,
and that Owners in turn work for Companies. The model setup will look
normal except that we use Ligament.Model instead of Backbone.Model,
etc.:

    // Basic Mode/Collection setup
    Note = Ligament.Model.extend();
    Notes = Ligament.Collection.extend({model: Note});
    
    Owner = Ligament.Model.extend();
    Owners = Ligament.Collection.extend({model: Owner});
    
    Company = Ligament.Model.extend();
    Companies = Ligament.Collection.extend({model: Company});
    
    // Initialize collections
    owners = new Owners([{id: 42
                          , name: "Bob from Accounting"
                          , company_id: 64}]);
    
    notes = new Notes([{id: 1
                        , text: "Please submit your TPS reports"
                        , owner_id: 42}]);
    
    companies = new Companies([{id: 64
                                , name: "Initech"}]);
    

Next comes the clunky part: Register each Model and Class, and then
the relationships between them:

    Ligament.registerModel("Note", Note);
    Ligament.registerModel("Owner", Owner);
    Ligament.registerModel("Company", Company);
    
    Ligament.registerCollection("notes", notes);
    Ligament.registerCollection("owners", owners);
    Ligament.registerCollection("companies", companies);
    
    Ligament.Model.belongsTo("Note", "owner", "owners", "owner_id");
    Ligament.Model.delegatesTo("Note", "owner_name", "owner", "name");
    
    Ligament.Model.belongsTo("Owner", "company", "companies", "company_id");
    Ligament.Model.delegatesTo("Owner", "company_name", "company", "name");
    
    Ligament.Model.delegatesTo("Note", "company_name", "owner", "company_name");

But once the drudgery is out of the way, your relationships are set up
and working:

    note.get('owner'); // <Owner Bob>
    note.get('owner').get('name'); // "Bob from Accounting"
    note.get('owner_name'); // "Bob from Accounting"
    note.get('owner').get('company'); // <Company Initech>
    note.get('owner').get('company_name'); // "Initech"
    note.get('company_name'); // "Initech"

# Associations #
## belongsTo ##

Sets an attribute on an object that finds an associated object in
another collection by id. If Note has an owner_id and you have a
collection called owners, you can link them with

    Ligament.Model.belongsTo(modelName, targetName, collectionName, foreignKey);

e.g.:

    Ligament.Model.belongsTo("Note", "owner", "owners", "owner_id");

## delegatesTo ##

Once you have told Ligament that a Model is joined to a Collection
through a belongsTo association, you can set attributes on your model
that delegate to attributes on the other object. For example, once you
have set up note.get('owner') to return a remote object, you can
delegate "owner_name" to get the "name" attribute from the note's
"owner":

    Ligament.Model.delegatesTo(modelName, targetName, associationName, foreignName);

e.g.

    Ligament.Model.delegatesTo("Note", "owner_name", "owner", "name");

One trick to watch out for is that the third parameter is NOT a
collection name, but the name of a belongsTo association you must have
already set up.


# Caveats and Limits #

* No attempt has been made for handling assignment. Ligament currently
  only works for read-only joins.
* This first version only has belongsTo and delegatesTo. hasMany and
  hasOne are not yet supported.
* This is super pre-alpha code! Ligament does not recover gracefully
  yet if you overwrite an association, if you try to retrieve an
  association that does not exist, or if you create infinite
  recursion. Have a care, Your Mileage May Explode.

# TODO #
* Clean up the DSL
* Make as much convention over configuration as possible. Given an
  association of "owner", for example, we should be able to figure out
  that the collection is "owners" and the foreignKey is "owner_id".
  (Not sure how to handle custom pluralizations like companies, people
  or children, though).
* Try to move belongsTo, etc., directly to the model classes, e.g.
  Note.belongsTo("owner")
* Try to figure out some metamagic that can identify collections as
  they are created.
* Safety checks to prevent infinite loops, handle missing records (id
  not found), and prevent accidental overwrite of existing attributes
* plural versions of registerModels/registerCollections so we can
  register them all in a single pass.


   
