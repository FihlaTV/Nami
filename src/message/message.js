/*!
 * A message.
 *
 * Copyright 2011 Marcelo Gornstein <marcelog@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/**
 * @fileoverview Base message class.
 *
 * @author Marcelo Gornstein - http://marcelog.github.com
 * Website: http://marcelog.github.com/Nami
 */

/**
 * Base message class.
 * @constructor
 */
function Message() {
    this.lines = [];
    this.EOL = "\r\n";
    this.variables = {};
}

/**
 * Used to serialize this message to a text representation understood by
 * AMI. Will return a set of lines delimited by \r\n and the message is delimited by
 * \r\n\r\n.
 * @returns {String}
 */
Message.prototype.marshall = function () {
    var output = "", key;
    for (key in this) {
        if (key === 'variables') {
            continue;
        }
        if (this.hasOwnProperty(key)) {
            if (key !== 'lines' && key !== 'EOL' && (typeof (this[key]) !== 'function')) {
                output = output + key + ": " + this[key] + this.EOL;
            }
        }
    }
    for (key in this.variables) {
        output = output + 'Variable: ' + key + '=' + this.variables[key] + this.EOL;
    }
    output = output + this.EOL;
    return output;
};

/**
 * Used to unserialize this message given a text representation understood by AMI.
 * Will split each line by \r\n and extract "key: value" pairs. Each key will be set
 * as a property inside this Message object with the corresponding value.
 * @returns void
 */
Message.prototype.unmarshall = function (data) {
    var value, parts, key, line = 0;
    this.lines = data.split(this.EOL);
    for (; line < this.lines.length; line = line + 1) {
        /*
         * string operations may be expensive at this point
         * and also this kind of string operation is really 
         * quick and dirty just to resolve my specific issue.
         *
         * Using the Action
         * -- namiLib.Actions.Command(); --
         * returns the command output with the string
         * --END COMMAND-- at the end.
         * The used delimiter ":" can course different
         * key/value output based on the result returned from the command.
         *
         * I think its easier to get the data from the output
         * when the string is in one peace instead of being
         * teared apart.
         * For this reason i simply added the new key "CommandOutput"
         * and passthrough the whole string as value
         */
        if(this.lines[line].indexOf("--END COMMAND--") != -1){
          key = "CommandOutput";
          value = this.lines[line].replace("--END COMMAND--", "");
        } else {
            parts = this.lines[line].split(":");
            key = parts.shift();
            /*
             * This is so, because if this message is a response, specifically a response to
             * something like "ListCommands", the value of the keys, can contain the semicolon
             * ":", which happens to be token to be used to split keys and values. AMI does not
             * specify anything like an escape character, so we cant distinguish wether we're
             * dealing with a multi semicolon line or a standard key/value line.
             */
            if (parts.length > 1) {
                value = parts.join(':');
            } else if (parts.length === 1) {
                value = parts[0];
            }
        }

        this.set(
            key.replace(/-/, '_').toLowerCase(),
            value.replace(/^\s+/g, '').replace(/\s+$/g, '')
        );
    }
};

/**
 * Call this one to set a property into this message.
 * @param {String} name The name of the property.
 * @param {String} value The value for the property.
 * @returns void
 */
Message.prototype.set = function (name, value) {
    this[name] = value;
};

/**
 * Returns the value for the given Message property.
 * @returns {String}
 */
Message.prototype.get = function (name) {
    return this[name];
};

exports.Message = Message;
