const userService = require('../services/userService');

const userController = {
  /**
   * Listar todos os usuários
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async listUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  },

  /**
   * Criar um novo usuário
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createUser(req, res) {
    try {
      const userData = req.body;
      
      // Validação básica
      if (!userData.name || !userData.email) {
        return res.status(400).json({ 
          error: 'Validation error',
          message: 'Name and email are required' 
        });
      }

      const newUser = await userService.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({ 
          error: 'Conflict',
          message: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  },

  /**
   * Obter um usuário por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not found',
          message: `User with id ${id} not found` 
        });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  },

  /**
   * Atualizar um usuário
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      // Validação básica
      if (userData.email && !isValidEmail(userData.email)) {
        return res.status(400).json({ 
          error: 'Validation error',
          message: 'Invalid email format' 
        });
      }

      const updatedUser = await userService.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ 
          error: 'Not found',
          message: `User with id ${id} not found` 
        });
      }
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  },

  /**
   * Excluir um usuário
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ 
          error: 'Not found',
          message: `User with id ${id} not found` 
        });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
};

// Função auxiliar para validação de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = userController;