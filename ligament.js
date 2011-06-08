// ligament.js -- Associations for Backbone

(function () {

  var Ligament;
  var _models = {};
  var _collections = {};
  var _associations = {};

  if (typeof exports !== 'undefined') {
    Ligament = exports;
  } else {
    Ligament = this.Ligament = {};
  }

  // Current version of the library.
  Ligament.VERSION = '0.1.0';


  Ligament.registerModel = function (name, model) {
    _models[name] = model;
    if (!model.prototype) model.prototype = {};
    model.prototype.modelName = name;
  };

  Ligament.models = _models;

  Ligament.registerCollection = function(name, collection) {
    _collections[name] = collection;
    if (!collection.prototype) collection.prototype = {};
    collection.prototype.collectionName = name;
  }

  Ligament.collections = _collections;

  // ======================================================================
  // Associations
  Ligament.Associations = {};

  // ======================================================================
  // BelongsTo
  // 
  // note.get('owner') ==> owners.get(note.get('owner_id'))
  Ligament.Associations.BelongsToAssociation = function (modelName, targetName, collectionName, foreignKey) {
    return {
      associationType: "belongsTo"
      , modelName: modelName
      , targetName: targetName
      , collectionName: collectionName
      , foreignKey: foreignKey
      , findTarget: function (modelElement) {
        return Ligament.collections[collectionName].get(modelElement.get(foreignKey))
      }
      , toString: function () {
        return "BelongsToAssociation: " + modelName + " belongs to " + targetName + " (" + collectionName + ") via " + foreignKey + ".";
      }
    }
  };


  // ======================================================================
  // DelegatesTo
  // 
  // You must have a belongsTo relationship set up already. You name a
  // local attribute, a belongsTo relationship, and the remote
  // attribute.
  // 
  // note.get('owner_name') ==> note.get('owner').get('name')
  Ligament.Associations.DelegatesToAssociation = function (modelName, targetName, associationName, foreignName) {
    return {
      associationType: "delegatesTo"
      , modelName: modelName
      , targetName: targetName
      , associationName: associationName
      , foreignName: foreignName
      , findTarget: function (modelElement) {
        return modelElement.get(associationName).get(foreignName);
      }
      , toString: function () {
        return "DelegatesToAssociation: " + modelName + " delegates " + targetName + " to " + associationName + "." + foreignName;
      }
    }
  };


  // ======================================================================
  // Ligament.Model
  Ligament.Model = Backbone.Model.extend({
    get: function (attribute) {
      var association = _associations[this.modelName];
      var finder;
      if (association) { finder = association[attribute]; }
      if (finder) {
        return finder.findTarget(this);
      } else {
        return Backbone.Model.prototype.get.call(this, attribute);
      }
    }
  });

  Ligament.registerAssociation = function (association) {
//    console.log("Registering '" + association.toString());
    if (!_associations[association.modelName]) _associations[association.modelName] = {};
    _associations[association.modelName][association.targetName] = association;
  }

  Ligament.Model.belongsTo = function (modelName, targetName, collectionName, foreignKey) {
    Ligament.registerAssociation(new Ligament.Associations.BelongsToAssociation(modelName, targetName, collectionName, foreignKey));
  };

  Ligament.Model.delegatesTo = function (modelName, targetName, associationName, foreignName) {
    Ligament.registerAssociation(new Ligament.Associations.DelegatesToAssociation(modelName, targetName, associationName, foreignName));
  };

  // ======================================================================
  // Ligament.Collection
  Ligament.Collection = Backbone.Collection.extend({
    // ;-) - Happy little no-op! Nothing to see here yet.
  });

  // ======================================================================
  // Ligament.View
  Ligament.View = Backbone.View.extend({
    // ;-) - Happy little no-op! Nothing to see here yet.
  });

}());

