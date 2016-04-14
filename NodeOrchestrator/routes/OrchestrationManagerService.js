/**
 * http://usejsdoc.org/
 */

exports.get = function(req, res){
  res.render('OrchestrationManagerService', { title: 'OrchestrationManagerService', expressionlist: 'just a list' });
};